import setuptools

setuptools.setup(
    name="tensorboard_3d_volume_plugin",
    version="0.1.0",
    description="Later",
    packages = ["tensorboard_3d_volume_plugin"],
    package_data = {"tensorboard_3d_volume_plugin" : ["static/**"],},
    entry_points = {
        "tensorboard_plugins": [
            "t3d_volume_plugin = tensorboard_3d_volume_plugin.plugin:TB3DVolumePlugin"
        ],
    },
)