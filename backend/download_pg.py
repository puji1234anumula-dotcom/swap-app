import urllib.request
import zipfile
import os
import sys

url = "https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64-binaries.zip"
zip_path = "postgres.zip"

print(f"Downloading Postgres from {url}...")
try:
    urllib.request.urlretrieve(url, zip_path)
    print("Download complete. Extracting...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(".")
    print("Extraction complete.")
    os.remove(zip_path)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
