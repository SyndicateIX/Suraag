import { ThreeElements } from '@react-three/fiber';

type ThreeIntrinsicElements = {
  mesh: any;
  group: any;
  boxGeometry: any;
  planeGeometry: any;
  cylinderGeometry: any;
  ringGeometry: any;
  circleGeometry: any;
  meshStandardMaterial: any;
  meshBasicMaterial: any;
  ambientLight: any;
  pointLight: any;
  directionalLight: any;
  [key: string]: any;
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeIntrinsicElements {}
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeIntrinsicElements {}
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends ThreeIntrinsicElements {}
  }
}

declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    interface IntrinsicElements extends ThreeIntrinsicElements {}
  }
}
