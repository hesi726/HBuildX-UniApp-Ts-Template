import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import UserMoney from './UserMoneyDetail.vue';
@Component({
	components: {
		UserMoney		
	}
})
export default class index extends Vue {
	title: string = 'Hello';
}
