import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function SvgComponent({ path, fill }) {
  return (
    <Svg width="100%" height="70%" viewBox="0 0 390 600" fill="none">
      <Path 
        opacity="0.563035"
        fillRule="evenodd"
        clipRule="evenodd"
        d={path}
        fill={fill}
      />
    </Svg>
  );
}