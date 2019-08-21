使用 HBuildX、UniApp 和 TypeScript 的项目模板  
1. 如何解决 从父组件继承下来的 prop 的无法在微信小程序绑定的问题;   
项目转到 TS 以后，基本就没有使用过 Js 了。。 
所以下面的所有代码都使用 TS 作为说明; (PS.，我的项目的 ts 和 vue 是分开的）。  

**父组件 BaseUniComponent.ts  就是定义了一个 父组件中的 prop**  
  
import { Component, Emit, Prop, Vue } from "vue-property-decorator";  
export default class BaseUniComponent extends Vue{  
	@Prop({ default: null})  
	propInParent: null | string;  
} 
**子组件 UserMoneyDetail.ts (继承子父组件，并且定义了一个子组件内的 prop)**  
import { Component, Emit, Prop, Vue } from "vue-property-decorator";  
import BaseUniComponent from './Basic/BaseUniComponent';  
@Component({})  
export default class UserIncome extends BaseUniComponent {  
	@Prop({default: null})  
	propInComponent: null | string;  
}    
**子组件页面:  UserMoneyDetail.vue ( 显示传入进来的 prop 的值）**  
<template>  
	<view class="content">  
		<view>propInComponent: {{propInComponent}}</view>  
		<view>propInParent: {{propInParent}}</view>  
	</view>  
</template>  
<script lang="ts" src='./UserMoneyDetail.ts'></script>    
** 入口页面 unientry.ts **     
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
**入口页面 unientry.vue (分别绑定了定义在子组件内部的 prop 和 子组件继承自父类的 prop) **  
<template>  
	<view>  
		<UserMoney :propInComponent='title' :propInParent='title'></UserMoney>  
	</view>  
</template>  
<script lang="ts" src='./unientry.ts'></script>    

**在 h5 中这个毫无疑问正常，会显示 2个 Hello,**  
**但是，编译到微信小程序中，却只会显示一个 Hello; （ 我的版本 ， HBuilder X  2.2.2.20190816, ）**  

最终发现一个是 HBuilder x 将代码编译成  微信小程序的问题， 
也就是  uni-mp-weixin/dist/index.js 编译时，会丢失从父类继承过来的 prop 的定义；  
此文件中第 682行定义了如下函数:   
function initVueComponent (Vue, vueOptions) {  
  vueOptions = vueOptions.default || vueOptions;  
  let VueComponent;  
  if (isFn(vueOptions)) {  
    VueComponent = vueOptions;  
    vueOptions = VueComponent.extendOptions;	  
  } else {  
    VueComponent = Vue.extend(vueOptions);  
  }  
  return [VueComponent, vueOptions]  
}    
根据 vue.d.ts ， 我没有找到 extendOptions 的任何说明，估计是一个未公开的属性吧;  
但是 VueComponent.extendOptions 这个属性里面不包含有继承自父类的 Prop，  
这也就使得，后面在根据返回的 vueOptions 去创建 Vue 的实例时，也丢失了从父类继承而来的 Prop,   
进而使得在 unientry.vue 中    :propInParent='title'  无法绑定子组件继承子父组件的 Prop;  

问题找到，改正倒是非常简单。 修改  initVueComponent 的函数定义就可以了；  
function initVueComponent (Vue, vueOptions) {  
  let inputVueOptions = vueOptions;  //方便调试  
  vueOptions = vueOptions.default || vueOptions;  
  let VueComponent;  
  if (isFn(vueOptions)) {  
    VueComponent = vueOptions;  
    vueOptions = VueComponent.extendOptions;  

        //#region 往 vueOptions 中补充定义在父组件中但未定义在子组件中的 prop  
	let defaultInputVueOptions = inputVueOptions['default'];  
	if (defaultInputVueOptions && defaultInputVueOptions.options && defaultInputVueOptions.options.props) {  
		if (!vueOptions.props) vueOptions.props = {};  
		let propsInDefaultInputVueOptions = defaultInputVueOptions.options.props;  
		for (var oneProp in propsInDefaultInputVueOptions) {  
			if (!vueOptions.props[oneProp]) {  
				vueOptions.props[oneProp] = propsInDefaultInputVueOptions[oneProp];  
			}  
		}  
	}  
        //#endregion  
  } else {  
    VueComponent = Vue.extend(vueOptions);  
  }  
  return [VueComponent, vueOptions]  
}    
**编译到微信小程序中，显示正常（ 我的版本 ， HBuilder X  2.2.2.20190816, ）**  

