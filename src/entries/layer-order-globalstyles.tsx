import '../tailwind.css';
import { LAYER_ORDER } from '../variants';
import { mount } from '../mount';
mount('layer-order-globalstyles', { enableCssLayer: true, globalLayerOrder: LAYER_ORDER });
