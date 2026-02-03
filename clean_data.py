import pandas as pd

def clean_data(df: pd.DataFrame) -> pd.DataFrame:   
    # only keep necessary columns
    df = df[['direct_sponsor', 'mixed_sponsors', 'mixed_sponsors_cat', 'umap_x', 'umap_y', 'Type']]

    # make new mixed_sponsors column

    #convert df to csv
    return df