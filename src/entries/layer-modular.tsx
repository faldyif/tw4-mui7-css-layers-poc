import '../tailwind.css';
import { LAYER_ORDER } from '../variants';
import { mount } from '../mount';
mount('layer-modular', { enableCssLayer: true, modularCssLayers: LAYER_ORDER });
