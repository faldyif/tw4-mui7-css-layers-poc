import '../tailwind-with-layer-order.css';
import { LAYER_ORDER } from '../variants';
import { mount } from '../mount';
mount('layer-order-css-and-globalstyles', { enableCssLayer: true, globalLayerOrder: LAYER_ORDER });
