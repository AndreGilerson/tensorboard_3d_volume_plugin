"""
This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.
This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with
this program. If not, see <http://www.gnu.org/licenses/>.
"""
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
