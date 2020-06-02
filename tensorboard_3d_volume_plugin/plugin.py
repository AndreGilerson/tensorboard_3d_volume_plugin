import os

import six
import json

from tensorboard.plugins import base_plugin
from tensorboard.util import tensor_util
import werkzeug
from werkzeug import wrappers

from tensorboard_3d_volume_plugin import metadata

from tensorboard import errors
from tensorboard import plugin_util
from tensorboard.backend import http_util

import numpy as np

import ants

class TB3DVolumePlugin(base_plugin.TBPlugin):
    plugin_name = "tb_3d_volume_plugin"

    def __init__(self, context):
        self._multiplexer = context.multiplexer
        self._logdir = context.logdir
    
    def is_active(self):
        return bool(self._multiplexer.PluginRunToTagToContent(self.plugin_name))

    def get_plugin_apps(self):
        return {
            "/index.js": self._serve_js,
            "/view": self._serve_view,

            "/runs": self._serve_runs,
            "/tags": self._serve_tags,
            "/volumes": self._serve_volumes,
            "/volume/*": self._serve_3dvolume,
        }
    
    def frontend_metadata(self):
        return base_plugin.FrontendMetadata(es_module_path="/index.js", tab_name="3D Volumes")

    @wrappers.Request.application
    def _serve_js(self, request):
        del request  # unused
        filepath = os.path.join(os.path.dirname(__file__), "static", "index.js")
        with open(filepath) as infile:
            contents = infile.read()
        return werkzeug.Response(contents, content_type="application/javascript")

    @wrappers.Request.application
    def _serve_view(self, request):
        filename = request.args.get("file")
        filepath = os.path.join(os.path.dirname(__file__), "static", filename)
        with open(filepath) as infile:
            contents = infile.read()
        return werkzeug.Response(contents, content_type="application/javascript")

    @wrappers.Request.application
    def _serve_runs(self, request):
        runs_with_3dvolume = self._multiplexer.PluginRunToTagToContent(self.plugin_name)
        runs_with_3dvolume = list(runs_with_3dvolume.keys())
        return http_util.Respond(request, runs_with_3dvolume, "application/json")

    @wrappers.Request.application
    def _serve_tags(self, request):
        run = request.args.get("run")
        runs = self._multiplexer.PluginRunToTagToContent(self.plugin_name)
        tags = runs[run]
        return http_util.Respond(request, list(tags.keys()), "application/json")

    @wrappers.Request.application
    def _serve_volumes(self, request):
        run = request.args.get("run")
        tag = request.args.get("tag")
        
        tensors = self._multiplexer.Tensors(run, tag)
        
        volumes = []
        for tensor in tensors:
            for item in tensor.tensor_proto.string_val:
                volumes.append(item.decode("utf-8"))
        
        print(volumes)
        return http_util.Respond(request, volumes, "application/json")

    @wrappers.Request.application
    def _serve_3dvolume(self, request):
        run = request.base_url.split("/")[-2]
        filename = request.base_url.split("/")[-1]

        img = open(os.path.join(self._logdir, run, "3dvolumes", filename), "rb")
        values = bytearray(img.read())
        return http_util.Respond(request, values, "application/json")