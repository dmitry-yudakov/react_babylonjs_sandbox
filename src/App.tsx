import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HDRCubeTexture, Mesh, PBRMaterial } from '@babylonjs/core';
import { Scene, Engine, useBeforeRender, useScene } from 'react-babylonjs';
import { FC, memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Color3,
  FreeCameraKeyboardMoveInput,
  MeshBuilder,
  UniversalCamera,
} from '@babylonjs/core';
import hdrImageTexture from './test.hdr';

const Orb: FC<{ pos: Vector3; rpm: number; base: Mesh }> = memo(
  ({ pos, rpm, base }) => {
    // const [y, setY] = useState(0);
    // useBeforeRender(() => {
    // console.log('before render apply position', pos);
    // if (ref.current) ref.current.position = pos;
    //   if (!scene) return;

    //   const deltaTimeInMillis = scene.getEngine().getDeltaTime();
    //   setY(
    //     (oldY) => oldY + (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000)
    //   );

    //   // setY((oldY) => oldY + 0.005);
    //   // setS((oldS) => oldS + 1);
    // });
    // console.log('rendering box', { y, s });

    const inst = useMemo(() => {
      return base.createInstance('box' + Math.random());
    }, [base]);

    // console.log('rendering box', { y, pos, base });
    return (
      <instancedMesh
        name={'box' + Math.random()}
        fromInstance={inst}
        source={base}
        position={pos}
        disposeInstanceOnUnmount
      >
        {/* <standardMaterial
        name="material"
        diffuseColor={Color3.Yellow()}
        specularColor={Color3.Black()}
      /> */}
      </instancedMesh>
    );
    // return (
    //   <box
    //     name="box"
    //     size={1}
    //     position={pos}
    //     // rotation={new Vector3(0, y, 0)}
    //     //fromInstance={}
    //   >
    //     <pbrMaterial
    //       name="glass"
    //       alpha={0.5}
    //       directIntensity={0.0}
    //       indexOfRefraction={0.52}
    //       cameraExposure={0.66}
    //       reflectivityColor={new Color3(0.2, 0.2, 0.2)}
    //       albedoColor={new Color3(0.95, 0.95, 0.95)}
    //     >
    //       <hdrCubeTexture
    //         name="skybox"
    //         url={hdrImageTexture}
    //         size={512}
    //         coordinatesMode={0}
    //       />
    //     </pbrMaterial>
    //   </box>
    // );
  }
);

const SPREAD = 100;
const INITIAL_NUM_OBJECTS = 5000;

const generateInitialPos = (size = 1000, max = SPREAD) => {
  const pos = [];
  for (let i = 0; i < size; i++) {
    pos.push(
      new Vector3(Math.random() * max, Math.random() * max, Math.random() * max)
    );
  }
  return pos;
};

const Objects = () => {
  const [objectsPos, setObjectsPos] = useState<Vector3[]>(
    generateInitialPos(INITIAL_NUM_OBJECTS, SPREAD)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setObjectsPos((oldPos) => [
        ...oldPos,
        new Vector3(
          Math.random() * SPREAD,
          Math.random() * SPREAD,
          Math.random() * SPREAD
        ),
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  console.log('rendering app', { objectsPos });
  const scene = useScene();

  const base = useMemo(() => {
    if (!scene) return null;

    const baseSphere = MeshBuilder.CreateSphere(
      'Odyssey123',
      { diameter: 1 },
      scene
    );
    // baseSphere.isVisible = false; // Made the original sphere invisible.

    const hdrTextureAccounts = new HDRCubeTexture(
      hdrImageTexture,
      scene,
      512,
      false,
      true,
      false,
      true
    );
    const glassMaterial = new PBRMaterial('glass', scene);
    glassMaterial.reflectionTexture = hdrTextureAccounts;
    glassMaterial.indexOfRefraction = 0.52;
    glassMaterial.alpha = 0.5;
    glassMaterial.directIntensity = 0.0;
    glassMaterial.environmentIntensity = 0.7;
    glassMaterial.cameraExposure = 0.66;
    glassMaterial.cameraContrast = 1.66;
    glassMaterial.microSurface = 1;
    glassMaterial.reflectivityColor = new Color3(0.2, 0.2, 0.2);
    glassMaterial.albedoColor = new Color3(0.95, 0.95, 0.95);
    baseSphere.material = glassMaterial;
    return baseSphere;
  }, [scene]);

  if (!base) return null;

  return (
    <transformNode name="gaga">
      {objectsPos.map((pos, i) => (
        <Orb key={i} pos={pos} rpm={5} base={base} />
      ))}
    </transformNode>
  );
};

const Player: FC<{ spawnPoint?: Vector3 }> = ({
  spawnPoint = new Vector3(0, 1, 0),
}) => {
  const cameraRef = useRef<UniversalCamera | null>(null);
  const sphereTransformRef = useRef<any>(null);

  const [isShiftDown, setIsShiftDown] = useState(false);

  useEffect(() => {
    if (cameraRef.current && sphereTransformRef.current) {
      console.log('Attach PLAYER view');
      const camera = cameraRef.current; //.hostInstance;
      const sphereTransform = sphereTransformRef.current; //.hostInstance;
      sphereTransform.setParent(camera);
      sphereTransform.position = new Vector3(0, -2, 10);
      // sphereTransform.position = Vector3.FromObject({x: 0, y: -2,z: 10});
    }

    // cameraRef.current?.inputs.addMouse();
    // cameraRef.current?.inputs.addKeyboard();
    // cameraRef.current?.inputs.addTouch();

    // Speed up camera
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        console.log('shift down');
        setIsShiftDown(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        console.log('shift up');
        setIsShiftDown(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <>
      <universalCamera
        ref={cameraRef}
        name="UniversalCamera"
        // position={new Vector3(0, 5, -10)}
        position={spawnPoint}
        rotationQuaternion={new Quaternion()}
        speed={isShiftDown ? 5 : 1}
        keysUp={[87]}
        keysDown={[83]}
        keysLeft={[65]}
        keysRight={[68]}
        keysUpward={[69]}
        keysDownward={[81]}
      />
      <sphere
        ref={sphereTransformRef}
        name="shinySphere"
        diameter={0.5}
        segments={32}
      >
        <standardMaterial
          name="shinySphereMaterial"
          diffuseColor={Color3.White()}
          specularColor={Color3.White()}
        />
      </sphere>
    </>
  );
};

const App: FC = () => {
  return (
    <div style={{ flex: 1, display: 'flex' }}>
      <Engine
        antialias
        adaptToDeviceRatio
        canvasId="babylon-js"
        renderOptions={{
          whenVisibleOnly: true,
        }}
      >
        <Scene>
          {/* <freeCamera
            name="camera1"
            position={new Vector3(0, 5, -10)}
            setTarget={[Vector3.Zero()]}
          /> */}

          <hemisphericLight
            name="light1"
            intensity={0.7}
            direction={new Vector3(0, 1, 0)}
          />
          <ground name="ground" width={10} height={6} />
          {/* <box
            name="box"
            size={2}
            position={new Vector3(0, 1, 0)}
            rotation={Vector3.Zero()}
          /> */}

          <Player />
          <Objects />

          <babylon-line name="line" />
        </Scene>
      </Engine>
    </div>
  );
};
export default App;
