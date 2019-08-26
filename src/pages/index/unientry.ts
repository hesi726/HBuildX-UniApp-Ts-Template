import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import UserMoney from './UserMoneyDetail.vue';
import Person from './Person';
@Component({
	components: {
		UserMoney		
	}
})
export default class UniEntry extends Vue {
	title: string = 'Hello';
	
	person: Person  = new Person('Dai', 1);
	created() {
		console.log('created at unientry.ts');
		//this.person = new Person('Person@created');
	}
	
	onLoad() {
		//this.person = new Person('Person@Onload');
	}
	
	mounted(){
		//this.person = new Person('Person@Mounted');
	}
	
	changeTimes: number = 0;
	changeTitle() {
		this.title = 'Hello:' + (++this.changeTimes);
	}
	
	changePerson(){
		this.person.name = 'Person:'  + (++this.changeTimes);
	}
}
