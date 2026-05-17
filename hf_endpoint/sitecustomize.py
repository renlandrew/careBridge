try:
    import os
    import subprocess
    import sys

    if os.environ.get("CAREBRIDGE_BOOTSTRAPPED") != "1":
        os.environ["CAREBRIDGE_BOOTSTRAPPED"] = "1"
        subprocess.check_call(
            [
                sys.executable,
                "-m",
                "pip",
                "install",
                "--upgrade",
                "--no-cache-dir",
                "torch>=2.6.0",
                "huggingface_hub>=1.1.0",
                os.environ.get(
                    "TRANSFORMERS_SOURCE_URL",
                    "https://github.com/huggingface/transformers/archive/refs/heads/main.zip",
                ),
            ]
        )

    import transformers.file_utils as file_utils
    import transformers.utils as utils

    for name in (
        "is_tf_available",
        "is_torch_available",
        "is_flax_available",
        "is_tokenizers_available",
        "is_vision_available",
    ):
        if not hasattr(file_utils, name) and hasattr(utils, name):
            setattr(file_utils, name, getattr(utils, name))
except Exception:
    pass
