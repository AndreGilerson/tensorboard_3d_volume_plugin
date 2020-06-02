import os
import datetime

import ants

import torch

from tensorboard.compat import tf
from tensorboard.compat.proto import summary_pb2
from torch.utils.tensorboard import FileWriter
from tensorboard.plugins.text.plugin_data_pb2 import TextPluginData
from tensorboard.compat.proto.tensor_pb2 import TensorProto
from tensorboard.compat.proto.tensor_shape_pb2 import TensorShapeProto

class TB3DVolumeSummary(object):
    def __init__(self, file_writer: FileWriter):
        self._file_writer = file_writer
        self._log_dir = os.path.join(self._file_writer.get_logdir(), "3dvolumes")
        os.makedirs(self._log_dir, exist_ok=True)
    
    def add_3dvolume(self, volume, tag, global_step=None, walltime=None):
        if global_step is None:
            filename = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        else:
            filename = str(global_step)
        
        if isinstance(volume, torch.Tensor):
            volume = volume.detach().cpu().numpy()

        img = ants.from_numpy(volume)
        ants.image_write(img, os.path.join(self._log_dir, filename + ".nii.gz"))

        plugin_data = tf.SummaryMetadata.PluginData(
            plugin_name='"tb_3d_volume_plugin"',
            content=TextPluginData(version=0).SerializeToString())
        metadata = tf.SummaryMetadata(plugin_data=plugin_data)
        tensor = TensorProto(dtype='DT_STRING',
                    string_val=[filename.encode(encoding='utf_8')],
                    tensor_shape=TensorShapeProto(dim=[TensorShapeProto.Dim(size=1)]))
        summary = summary_pb2.Summary(value=[summary_pb2.Summary.Value(tag=tag,
            metadata=metadata, tensor=tensor)])
        self._file_writer.add_summary(summary, global_step=global_step, walltime=walltime)
        self._file_writer.flush()


    