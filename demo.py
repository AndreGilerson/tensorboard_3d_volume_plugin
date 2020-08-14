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
import ants

import torch
from torch.utils.tensorboard import FileWriter

from tensorboard_3d_volume_plugin import tb3dvolume_summary

img = ants.image_read("unet.nii.gz")

writer = FileWriter("test/9")
volume_summary = tb3dvolume_summary.TB3DVolumeSummary(writer)

volume_summary.add_3dvolume(img.numpy(), "output", 1)

img_tensor = torch.from_numpy(img.numpy())

volume_summary.add_3dvolume(img_tensor, "input", 1)
