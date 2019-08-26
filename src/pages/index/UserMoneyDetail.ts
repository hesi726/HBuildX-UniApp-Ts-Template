import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import BaseUniComponent from './BaseUniComponent';
import Person from './Person';

@Component({})
export default class UserMoneyDetail extends BaseUniComponent {
	@Prop({default: null})
	propInComponent: null | string;
	
	@Prop({ required: true})
	assignperson: Person
	
	tipsInComponent: string = "tips in Component";
	
	changeTimes: number = 0;
	setPersonName() {
		this.assignperson.name = 'ChildHello,' + (++ this.changeTimes);
	}
}
