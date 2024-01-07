import * as React from 'react';
import Svg, { Path, LinearGradient, Defs, Stop } from 'react-native-svg';

export default function SvgComponent({ path, fill }) {
  return (
    <Svg width="80%" height="60%" viewBox="0 0 287 371" fill="none">
        <Defs>
            <LinearGradient id="paint0_linear_102_5" x1="17.1626" y1="-528.447" x2="523.102" y2="-47.5952" gradientUnits="userSpaceOnUse">
                <Stop stopColor="#00BCD4"/>
                <Stop offset="1" stopColor="#673AB7"/>
            </LinearGradient>
        </Defs>
        <Path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d={path} 
            fill={fill}
        />
  </Svg>
  );
}