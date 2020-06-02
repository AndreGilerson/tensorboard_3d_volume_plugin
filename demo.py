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
