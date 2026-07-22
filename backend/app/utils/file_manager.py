import os
import json
import time
import uuid
from pathlib import Path

# Paths
DEFAULT_OUTPUT_DIR = Path.home() / "Downloads"
DEFAULT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CONFIG_FILE = Path(__file__).resolve().parent.parent.parent / "config.json"
TEMP_DIR = Path(__file__).resolve().parent.parent.parent / "temp_storage"
TEMP_DIR.mkdir(parents=True, exist_ok=True)

def get_output_dir() -> Path:
    """Read the current output directory from config or return default Downloads."""
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r") as f:
                data = json.load(f)
                custom_path = data.get("output_dir")
                if custom_path:
                    path_obj = Path(custom_path)
                    path_obj.mkdir(parents=True, exist_ok=True)
                    return path_obj
        except Exception:
            pass
    return DEFAULT_OUTPUT_DIR

def set_output_dir(new_dir_path: str) -> Path:
    """Update and persist the output directory in config.json."""
    path_obj = Path(new_dir_path).resolve()
    path_obj.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump({"output_dir": str(path_obj)}, f, indent=2)
    return path_obj

def get_temp_path(filename: str) -> Path:
    """Generate a unique path inside the temp storage directory."""
    unique_id = uuid.uuid4().hex[:8]
    ext = Path(filename).suffix
    base_stem = Path(filename).stem
    safe_stem = "".join([c if c.isalnum() or c in ("-", "_") else "_" for c in base_stem])
    return TEMP_DIR / f"{safe_stem}_{unique_id}{ext}"

def copy_to_output_dir(source_path: Path, target_filename: str = None) -> Path:
    """Copy a generated file into the configured output directory (Downloads or custom)."""
    out_dir = get_output_dir()
    filename = target_filename if target_filename else source_path.name
    destination = out_dir / filename
    
    # Avoid overwriting existing files by appending a counter if needed
    counter = 1
    stem = Path(filename).stem
    ext = Path(filename).suffix
    while destination.exists():
        destination = out_dir / f"{stem}_{counter}{ext}"
        counter += 1
        
    with open(source_path, "rb") as rf:
        with open(destination, "wb") as wf:
            wf.write(rf.read())
            
    return destination

def cleanup_old_files(max_age_seconds: int = 3600):
    """Remove temporary files older than max_age_seconds (default 1 hour)."""
    now = time.time()
    for file_path in TEMP_DIR.glob("*"):
        if file_path.is_file():
            if now - file_path.stat().st_mtime > max_age_seconds:
                try:
                    file_path.unlink()
                except Exception:
                    pass
