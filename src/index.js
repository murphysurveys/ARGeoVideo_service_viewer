import * as THREE from '../build/three.module.js';

			import { OrbitControls } from './jsm/controls/OrbitControls.js';
			import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
			import { RGBELoader } from './jsm/loaders/RGBELoader.js';
			import { RoughnessMipmapper } from './jsm/utils/RoughnessMipmapper.js';

			import { PLYLoader } from './jsm/loaders/PLYLoader.js';

			var container, controls;
			var camera, scene, renderer;
			var gltfScene;
			var raycastArray = [];

			var options = {
				opacityLevel: 0.5,
				togglePanoramas: true,
				toggleBIM: true,
				lockOrbit: true
			};

			var panoMesh;

			var gui = new dat.GUI();
			gui.domElement.parentElement.style.zIndex = 1000;

			gui.add( options, 'opacityLevel', 0, 1 ).step( 0.01 ).name( 'opacity level' ).onChange( function ( value ) {
					panoMesh.material.opacity = value;
					renderer.render(scene, camera);
			} );

			gui.add( options, 'togglePanoramas' ).name( 'toggle panoramas' ).onChange( function ( value ) {
				panoMesh.visible = value;
				renderer.render(scene, camera);
			} );

			gui.add( options, 'toggleBIM' ).name( 'toggle BIM' ).onChange( function ( value ) {
				//for ( var i = 0; i < clickableObjects.length; i ++ ) {
				//  clickableObjects[ i ].visible = value;
				//}
				scene1.visible = value;
			} );

			gui.add( options, 'lockOrbit' ).name( 'lock orbit' ).onChange( function ( value ) {
				if ( value == false ) {
					viewer.scene.remove( viewer.scene.view.lookAt( intersects[0].object.position.x, intersects[0].object.position.y, intersects[0].object.position.z ) );
				}
			} );

			init();
			render();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1e-6, 1e12 );
				camera.position.set(- 1.8, 0.6, 2.7 ); // 678752, 5907144, 12.885000705718994 ); //
				//camera.position.set(-703196.65625, 78.01599884033203, -7035536.25);


				scene = new THREE.Scene();

				var size = 10;
var divisions = 10;

var gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

				var light = new THREE.AmbientLight( 0x404040 ); // soft white light
				scene.add( light );

				var panoGeom = new THREE.SphereBufferGeometry( 500, 60, 40 );
				panoGeom.scale( - 1, 1, 1 );
				var panoTex = new THREE.TextureLoader().load( './a1.jpg' );
				var panoMat = new THREE.MeshBasicMaterial( {depthTest: true, side: THREE.DoubleSide, map: panoTex, transparent: true, opacity: 0.5 } );
				//var panoOutside = new THREE.MeshNormalMaterial( /*{ side: THREE.FrontSide }*/ );
				panoMesh = new THREE.Mesh( panoGeom, panoMat );//panoMat );
				panoMesh.renderOrder = 1;
				panoMesh.position.set( 10, 10, 5 );
				scene.add( panoMesh );

				new RGBELoader()
					.setDataType( THREE.UnsignedByteType )
					.setPath( 'textures/equirectangular/' )
					.load( 'royal_esplanade_1k.hdr', function ( texture ) {

						var envMap = pmremGenerator.fromEquirectangular( texture ).texture;

						//scene.background = envMap;
						//scene.environment = envMap;

						texture.dispose();
						pmremGenerator.dispose();

						render();

						// model

						// use of RoughnessMipmapper is optional
						var roughnessMipmapper = new RoughnessMipmapper( renderer );

						var loader = new GLTFLoader().setPath( '../assets/' );
						loader.load( '0.gltf', function ( gltf ) { // 'ITM_from_IFC_exporter.gltf', function ( gltf ) {

							console.log("in gltf ", gltf);

							gltf.scene.traverse( function ( child ) {

								if ( child.isMesh ) {

									child.material.depthTest = true;

									//child.material = new THREE.MeshBasicMaterial({color: '#ff0000', side: THREE.DoubleSide});

									// TOFIX RoughnessMipmapper seems to be broken with WebGL 2.0
									// roughnessMipmapper.generateMipmaps( child.material );

									//raycastArray.push(child);

								}

							} );

							gltfScene = gltf.scene;
							gltfScene.renderOrder = 0;
							console.log("gltfScene ", gltf, gltfScene);


							//gltfScene.position.set(703196.65625, -78.01599884033203, 7035536.25);
							//gltfScene.scale.multiplyScalar(0.001);

							gltfScene.rotateX(Math.PI*0.5);

							scene.add( gltfScene );
							raycastArray.push(gltfScene);

							roughnessMipmapper.dispose();

							//panoMesh.position.set(-703196.65625, 78.01599884033203, -7035536.25);
							//camera.position.set(-703196.65625, 78.01599884033203, -7035536.25);



							render();

						} );

					} );

				//	var pgeometry = new THREE.PlaneGeometry( 10, 10, 1, 1 );
				//	pmesh = new THREE.Mesh( pgeometry, material.clone() );
				//	pmesh.material.color.set( 0xff0000 );
				//	pmesh.renderOrder = 0;
				//	scene.add( pmesh );

/*
				const plyloader = new PLYLoader();
				plyloader.load('../assets/odm_translated.ply', function ( plygeometry ) { //odm_georeferenced_model.ply

					//plygeometry.computeVertexNormals();

					const plymaterial = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors } );
					const plymesh = new THREE.Points( plygeometry, plymaterial );

				//	plymesh.translateX = -678752;
				//	plymesh.translateY = -5907144;
				//	plymesh.translateZ = -12;
					//plymesh.rotation.x = - Math.PI / 2;
					//plymesh.scale.multiplyScalar( 0.001 );

					console.log("plymesh ", plymesh);

					plymesh.castShadow = true;
					plymesh.receiveShadow = true;

					scene.add( plymesh );

					//const boundSphere = new THREE.Mesh();
				//	panoMesh.position.set(plymesh.geometry.boundingSphere.center.x, plymesh.geometry.boundingSphere.center.y, plymesh.geometry.boundingSphere.center.z);

				//	console.log("panoMesh ", panoMesh);

					//camera.lookAt(plymesh.position);

				});
*/

function rotate(vector, angleaxis) {
		var v = new THREE.Vector3(vector[0], vector[1], vector[2]);
		var axis = new THREE.Vector3(angleaxis[0],
																 angleaxis[1],
																 angleaxis[2]);
		var angle = axis.length();
		axis.normalize();
		var matrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
		v.applyMatrix4(matrix);
		return v;
}

	var shotList = [];

	(async () => {
		fetch("./shots.geojson")
		.then(function(res) {
			return res.json();
		})
		.then(async function(data) {

			var xOff = 678790.3753; //712158.3404830345;
			var yOff = 5907109.1250; //727174.4985701079;
			var zOff = 42.43303740163056;

			//for (key in data.featureCollection) {
			data.features.map((feature) => {

				var [x, y, z] = feature.properties.translation; //geometry.coordinates;
				var [rx, ry, rz] = feature.properties.rotation;

				var gjBox = new THREE.Mesh(new THREE.SphereGeometry(0.25,64,64), new THREE.MeshBasicMaterial({color: '#ff0000'}));
				gjBox.position.set(x - xOff, y - yOff, z - zOff);
				//console.log(gjBox.position);

				gjBox.userData.shot_id = feature.properties.filename;

				shotList.push(gjBox);

				scene.add(gjBox);

			});

		});
	})();

				renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.toneMapping = THREE.ACESFilmicToneMapping;
				renderer.toneMappingExposure = 1;
				renderer.outputEncoding = THREE.sRGBEncoding;
				container.appendChild( renderer.domElement );

				var pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileEquirectangularShader();

				controls = new OrbitControls( camera, renderer.domElement );
				controls.addEventListener( 'change', render ); // use if there is no animation loop
				//controls.minDistance = 2;
				//controls.maxDistance = 10;
				//controls.target.set( 0, 0, - 0.2 );
				//controls.target.set(-703197.65625, 79.01599884033203, -7035536.25);
				controls.update();

				window.addEventListener( 'resize', onWindowResize, false );

				document.addEventListener("mousedown", onDocumentMouseDown1, false);

/**/

var points = [
  new THREE.Vector3(),
  new THREE.Vector3()
]
var clicks = 0;

var markerA = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 10, 20),
  new THREE.MeshBasicMaterial({
    color: 0xff5555
  })
);
var markerB = markerA.clone();
var markers = [
  markerA, markerB
];
scene.add(markerA);
scene.add(markerB);

var lineGeometry = new THREE.Geometry();
lineGeometry.vertices.push(new THREE.Vector3());
lineGeometry.vertices.push(new THREE.Vector3());
var lineMaterial = new THREE.LineBasicMaterial({
  color: 0xff5555
});
var line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

function getIntersections(event) {
  var vector = new THREE.Vector2();

  vector.set(
    event.clientX / window.innerWidth * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(vector, camera);

  var intersects = raycaster.intersectObjects(raycastArray[0].children);

  return intersects;
}

function setLine(vectorA, vectorB) {
  line.geometry.vertices[0].copy(vectorA);
  line.geometry.vertices[1].copy(vectorB);
  line.geometry.verticesNeedUpdate = true;
}

function onDocumentMouseDown(event) {
  var intersects = getIntersections(event);

  if (intersects.length > 0) {

  console.log("intersect point ", intersects[0]);

		var distancePlace = document.getElementById("distancePlace");

    points[clicks].copy(intersects[0].point);
    markers[clicks].position.copy(intersects[0].point);
    setLine(intersects[0].point, intersects[0].point);
    clicks++;
    if (clicks > 1){
      var distance = points[0].distanceTo(points[1]);
      distancePlace.innerText = distance + " metres";
      setLine(points[0], points[1]);
      clicks = 0;
			renderer.render(scene, camera);
    }
  }
}


function getIntersections1(event) {
  var vector = new THREE.Vector2();

  vector.set(
    event.clientX / window.innerWidth * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(vector, camera);

  var intersects = raycaster.intersectObjects(shotList);

  return intersects;
}

function onDocumentMouseDown1(event) {
  var intersects = getIntersections1(event);

  if (intersects.length > 0) {

  console.log("intersect point ", intersects[0]);

		var distancePlace = document.getElementById("distancePlace");

    markers[clicks].position.copy(intersects[0].point);

		intersects[0].object.material = new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide}); //new THREE.Color(0x00ff00); //"#00ff00";

		camera.position.x = intersects[0].object.position.x;
		camera.position.y = intersects[0].object.position.y;
		camera.position.z = intersects[0].object.position.z;
		camera.updateProjectionMatrix();

			renderer.render(scene, camera);

  }
}
/**/
			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}

			//

			function render() {

				renderer.render( scene, camera );

			}
