import { Component, Emit, Prop, Vue } from "vue-property-decorator";
export default class BaseUniComponent extends Vue{
	@Prop({ default: null})
	propInParent: null | string;
	
	tipsInParent: string = "Tips in Parent";
}
