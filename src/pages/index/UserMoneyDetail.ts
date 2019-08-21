import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import BaseUniComponent from './BaseUniComponent';
@Component({})
export default class UserIncome extends BaseUniComponent {
	@Prop({default: null})
	propInComponent: null | string;
	
	tipsInComponent: string = "tips in Component";
}
