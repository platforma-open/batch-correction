import pandas as pd
import scanpy as sc
import harmonypy as hm
import argparse
import os
from scipy.sparse import csr_matrix
import scanpy.external.pp as sce

# Argument parsing
parser = argparse.ArgumentParser(description="Batch correction and dimensionality reduction for scRNA-seq data")
parser.add_argument("--counts", help="Path to raw counts CSV file", required=True)
parser.add_argument("--metadata", help="Path to metadata CSV file", required=True)
parser.add_argument("--output", help="Path to output directory", required=True)
args = parser.parse_args()

# Create output directory if it doesn't exist
os.makedirs(args.output, exist_ok=True)

# Load raw count data (long format)
print("Loading raw counts...")
counts_df = pd.read_csv(args.counts)

# Load metadata
print("Loading metadata...")
metadata_df = pd.read_csv(args.metadata)

# Check for required columns
if not all(col in counts_df.columns for col in ["SampleId", "CellId", "GeneId", "Count"]):
    raise ValueError("Count matrix must contain SampleId, CellId, GeneId, and Count columns.")
if not all(col in metadata_df.columns for col in ["SampleId", "Batch"]):
    raise ValueError("Metadata must contain SampleId and Batch columns.")

# Merge metadata into count matrix
counts_df = counts_df.merge(metadata_df, on="SampleId")

# Convert long format to cell x gene matrix
print("Converting long format to cell-by-gene matrix...")
cell_gene_matrix = counts_df.pivot_table(
    index=["SampleId", "CellId"], columns="GeneId", values="Count", aggfunc="sum", fill_value=0
)

# Convert to AnnData
print("Creating AnnData object...")
adata = sc.AnnData(X=csr_matrix(cell_gene_matrix.values))  # Convert to sparse matrix
adata.obs = cell_gene_matrix.index.to_frame(index=False)  # Add SampleId & CellId metadata
adata.var_names = cell_gene_matrix.columns  # Gene names

# Add batch information
adata.obs = adata.obs.merge(metadata_df, on="SampleId")

# Apply ComBat for batch correction at expression level
print("Applying ComBat batch correction...")
sce.combat(adata, key="Batch")

# Save batch-corrected counts in long format
print("Saving batch-corrected count matrix...")
corrected_counts = pd.DataFrame(adata.X.toarray(), index=adata.obs_names, columns=adata.var_names).reset_index()
corrected_counts = corrected_counts.melt(id_vars=["SampleId", "CellId"], var_name="GeneId", value_name="Count")
corrected_counts.to_csv(os.path.join(args.output, "batch_corrected_counts.csv"), index=False)

# Normalize batch-corrected counts using Scanpy's recommended strategy
print("Normalizing batch-corrected counts (total count scaling + log transformation)...")
sc.pp.normalize_total(adata, target_sum=1e4)  # Normalize per cell
sc.pp.log1p(adata)  # Log-transform

# Save normalized batch-corrected counts in long format
print("Saving normalized batch-corrected count matrix...")
normalized_counts = pd.DataFrame(adata.X.toarray(), index=adata.obs_names, columns=adata.var_names).reset_index()
normalized_counts = normalized_counts.melt(id_vars=["SampleId", "CellId"], var_name="GeneId", value_name="NormalizedCount")
normalized_counts.to_csv(os.path.join(args.output, "batch_corrected_normalized_counts.csv"), index=False)

# Scale before PCA
print("Scaling data for PCA...")
sc.pp.scale(adata)

# Perform PCA
print("Running PCA...")
sc.tl.pca(adata, n_comps=50)

# Apply Harmony for batch correction at PCA level
print("Applying Harmony batch correction on PCA embeddings...")
harmony_results = hm.run_harmony(adata.obsm["X_pca"], adata.obs["Batch"])
adata.obsm["X_pca_harmony"] = harmony_results.Z_corr

# Compute neighbors using Harmony-corrected PCA
sc.pp.neighbors(adata, use_rep="X_pca_harmony")

# Run UMAP
print("Running UMAP...")
sc.tl.umap(adata)

# Run tSNE
print("Running tSNE...")
sc.tl.tsne(adata)

# Save UMAP coordinates in long format
print("Saving UMAP coordinates...")
umap_df = pd.DataFrame(adata.obsm["X_umap"], columns=["UMAP1", "UMAP2"], index=adata.obs_names).reset_index()
umap_df.to_csv(os.path.join(args.output, "umap_dimensions.csv"), index=False)

# Save t-SNE coordinates in long format
print("Saving tSNE coordinates...")
tsne_df = pd.DataFrame(adata.obsm["X_tsne"], columns=["tSNE1", "tSNE2"], index=adata.obs_names).reset_index()
tsne_df.to_csv(os.path.join(args.output, "tsne_dimensions.csv"), index=False)

print("Batch correction and dimensionality reduction completed successfully!")
