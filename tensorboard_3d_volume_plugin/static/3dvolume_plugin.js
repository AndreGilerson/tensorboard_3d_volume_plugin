const file = "volumes.nii.gz"

const colors = {
    red: 0xff0000,
    blue: 0x0000ff,
    darkGrey: 0x353535,
};

var CustomProgressBar = function(container) {
    this._container = container;
    this._modes = {
        load: {
            name: 'load',
            color: '#FF0000'
        },
        parse: {
            name: 'parse',
            color: '#00FF00'
        }
    };
    this._requestAnimationFrameID = null;
    this._mode = null;
    this._value = null;
    this._total = null;

    this.init = function() {
        var container = document.createElement('div');
        container.classList.add('progress');
        container.classList.add('container');
        container.innerHTML =
            '<div class="progress load"></div><div class="progress parse">Parsing data <div class="lds-dual-ring"></div></div>';
        this._container.appendChild(container);
        // start rendering loop
        this.updateUI();
    }.bind(this);

    this.update = function(value, total, mode) {
        this._mode = mode;
        this._value = value;
        // depending on CDN, total return to XHTTPRequest can be 0.
        // In this case, we generate a random number to animate the progressbar
        if (total === 0) {
            this._total = value;
            this._value = Math.random() * value;
        } else {
            this._total = total;
        }
    }.bind(this);

    this.updateUI = function() {
        var self = this;
        this._requestAnimationFrameID = requestAnimationFrame(self.updateUI);

        if (
            !(
                this._modes.hasOwnProperty(this._mode) &&
                this._modes[this._mode].hasOwnProperty('name') &&
                this._modes[this._mode].hasOwnProperty('color')
            )
        ) {
            return false;
        }

        var progress = Math.round(this._value / this._total * 100);
        var color = this._modes[this._mode].color;

        var progressBar = this._container.getElementsByClassName('progress ' + this._modes[this._mode].name);
        if (progressBar.length > 0) {
            progressBar[0].style.borderColor = color;
            progressBar[0].style.width = progress + '%';
        }
        progressBar = null;

        if (this._mode === 'parse') {
            // hide progress load
            var loader = this._container.getElementsByClassName('progress load');
            loader[0].style.display = 'none';
            // show progress parse
            var container = this._container.getElementsByClassName('progress container');
            container[0].style.height = 'auto';
            container[0].style.width = 'auto';
            container[0].style.padding = '10px';
            var parser = this._container.getElementsByClassName('progress parse');
            parser[0].style.display = 'block';
            parser[0].style.width = '100%';
        }
    }.bind(this);

    this.free = function() {
        var progressContainers = this._container.getElementsByClassName('progress container');
        // console.log( progressContainers );
        if (progressContainers.length > 0) {
            progressContainers[0].parentNode.removeChild(progressContainers[0]);
        }
        progressContainers = null;
        // stop rendering loop
        window.cancelAnimationFrame(this._requestAnimationFrameID);
    }.bind(this);

    this.init();
};

const container = document.getElementById('ami_container');
const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setClearColor(colors.darkGrey, 1);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new AMI.OrthographicCamera(
    container.clientWidth / -2,
    container.clientWidth / 2,
    container.clientHeight / 2,
    container.clientHeight / -2,
    0.1,
    10000
);

// Setup controls
const controls = new AMI.TrackballOrthoControl(camera, container);
controls.staticMoving = true;
controls.noRotate = true;
camera.controls = controls;

const onWindowResize = () => {
    camera.canvas = {
        width: container.offsetWidth,
        height: container.offsetHeight,
    };
    camera.fitBox(2);

    renderer.setSize(container.offsetWidth, container.offsetHeight);
};
window.addEventListener('resize', onWindowResize, false);

const animate = () => {
    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(function () {
        animate();
        console.log("frame");
    });
};

createGui();
animate();

var loader = null;

const showVolume = async () => {
    console.log("file loaded");
    const series = loader.data[0].mergeSeries(loader.data);
    const stack = series[0].stack[0];
    loader.free();
    lodaer = null;

    const stackHelper = new AMI.StackHelper(stack);
    stackHelper.bbox.visible = false;
    stackHelper.border.color = colors.red;
    scene.add(stackHelper);

    // center camera and interactor to center of bouding box
    // for nicer experience
    // set camera
    const worldbb = stack.worldBoundingBox();
    const lpsDims = new THREE.Vector3(
        worldbb[1] - worldbb[0],
        worldbb[3] - worldbb[2],
        worldbb[5] - worldbb[4]
    );

    const box = {
        center: stack.worldCenter().clone(),
        halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10),
    };

    // init and zoom
    const canvas = {
        width: container.clientWidth,
        height: container.clientHeight,
    };

    camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
    camera.box = box;
    camera.canvas = canvas;
    camera.update();
    camera.fitBox(2);
}

async function createGui() {
    const gui = new dat.GUI({
        autoPlace: false,
    });

    const customContainer = document.getElementById('gui_container');
    customContainer.appendChild(gui.domElement);

    const runFolder = gui.addFolder("Runs and tags available");
    var runUtils = {
        Run: "",
        Tag: "",
        Volume: "",
    }

    var runs = await fetch("runs")
        .then(response => response.json());
    var runSelector = runFolder.add(runUtils, "Run", runs);
    var tagSelector = runFolder.add(runUtils, "Tag", []);
    var volumeSelector = runFolder.add(runUtils, "Volume", [])

    var run = "";

    runSelector.onChange(async value => {
        tagSelector = tagSelector.options([""]);
        tagSelector.setValue("");
        volumeSelector = volumeSelector.options([""]);
        volumeSelector.setValue("");

        run = value;
        var tags = await fetch("tags/?run=" + value)
            .then(response => response.json())
        
        tags.unshift("");

        tagSelector = tagSelector.options(tags);
        tagSelector.onChange(async value => {
            volumeSelector = volumeSelector.options([""]);
            volumeSelector.setValue("");

            var volumes = await fetch("volumes/?run=" + run + "&tag=" + value)
                .then(response => response.json())
            
            volumes.unshift("");
            volumeSelector = volumeSelector.options(volumes);
            volumeSelector.onChange(async value => {
                loader = new AMI.VolumeLoader(container, CustomProgressBar);
                loader
                    .load("volume/"+run+"/"+value+".nii.gz")
                    .then(showVolume)
                    .catch(error => {
                        window.console.log('oops... something went wrong...');
                        window.console.log(error);
                    });
            })
        })
    })

    runFolder.open();
};
