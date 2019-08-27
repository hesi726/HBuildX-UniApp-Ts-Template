# 使用 HBuildX、UniApp 和 TypeScript 的项目模板
项目转到 TS 以后，基本就没有使用过 Js 了。。
所以下面的所有代码都使用 TS 作为说明; (PS.，我的项目的 ts 和 vue 是分开的）。

2019-08-27. **临时解决 2019-08-26 的问题**
只是真的太复杂了一点;

根据  http://www.typescriptlang.org/docs/handbook/decorators.html  添加自定义修饰方法

      
export function enumerable(value: boolean) {
    
	  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        
		descriptor.enumerable = value;
    
	  };
       
}

给 Person.ts 中的 nameInGet 添加标注 (必须，因为不添加标注的话，nameInGet 在深度复制时无法显示在 for .. in 访问到的对象属性中)

       import { enumerable } from './Decorators';
       ........
       @enumerable(true)
       get nameInGet(): string {
		console.log('准备通过 get 去获取 name');
		return this.name;
       }
	

修改 mp.runtime.esm.js 添加如下的深度复制对象的方法, 
       
       /**
       *  根据https://www.jianshu.com/p/b084dfaad501 改用深度复制方法;
       **/
       function  xcloneWithData(data) {
	      const type = judgeType(data);
	      let obj;
	      if (type === 'array') {
		obj = [];
	      } else if (type === 'object') {
		obj = {};
	      } else {
	    // 不再具有下一层次
		return data;
	      }
	      if (type === 'array') {
		// eslint-disable-next-line
		for (let i = 0, len = data.length; i < len; i++) {
		  obj.push(xcloneWithData(data[i]));
		}
	      } else if (type === 'object') {
		// 对原型上的方法也拷贝了....
		// eslint-disable-next-line
		for (const key in data) {
		  obj[key] = xcloneWithData(data[key]);
		}
	      }
	      return obj;
	}


	function  judgeType(obj) {
	  // tostring会返回对应不同的标签的构造函数
	      const toString = Object.prototype.toString;
	      const map = {
		'[object Boolean]': 'boolean',
		'[object Number]': 'number',
		'[object String]': 'string',
		'[object Function]': 'function',
		'[object Array]': 'array',
		'[object Date]': 'date',
		'[object RegExp]': 'regExp',
		'[object Undefined]': 'undefined',
		'[object Null]': 'null',
		'[object Object]': 'object',
	      };
	      /*if (obj instanceof Element) {
		return 'element';
	      }*/
	      return map[toString.call(obj)];
	}
		
	 

	function cloneWithData(vm) {
	  // 确保当前 vm 所有数据被同步
	  var ret = Object.create(null);
	  var dataKeys = [].concat(
	    Object.keys(vm._data || {}),
	    Object.keys(vm._computedWatchers || {}));

	  dataKeys.reduce(function(ret, key) {
	    ret[key] = vm[key];
	    return ret
	  }, ret);
	  //TODO 需要把无用数据处理掉，比如 list=>l0 则 list 需要移除，否则多传输一份数据
	  Object.assign(ret, vm.$mp.data || {});
	  if (
	    Array.isArray(vm.$options.behaviors) &&
	    vm.$options.behaviors.indexOf('uni://form-field') !== -1
	  ) { //form-field
	    ret['name'] = vm.name;
	    ret['value'] = vm.value;
	  }
		
	  return xcloneWithData(ret);
	  //return JSON.parse(JSON.stringify(ret))
       }


2019-08-26. Bug **页面和内部组件传递Prop时参数类型丢失**
[参见BUG报告](https://ask.dcloud.net.cn/question/77596) 
这个Bug比较严重了，
例如，我的例子， 在 src/pages/index/Person.ts 中定义了如下一个只读的值, 

       export default class Person {
		/**
		 * 
		 */
		constructor(public name: string, public jsonSerializeTimes: number = 1) {		
		}
		
		get nameInGet(): string {
			console.log('准备通过 get 去获取 name');
			return this.name;
		}
       }


在页面 unientry.ts 定义了一个 Person 的一个实例, 并将此实例通过 prop 转到子组件中: 

       <UserMoneyDetail :assignperson.sync='person' :propInComponent='title' :propInParent='title'></UserMoneyDetail>
	   
然后在子组件中想访问 nameInGet 字段: 

       <view>演示通过get获取name: {{person.nameInGet}}</view>

这个时候会显示 undefined;
这意味着，在我们自己的模型类中，不能定义自己的方法或者只读字段, 因为它们不能通过 Json序列化反序列化还原 ；

2019-08-26. Bug **页面和内部组件无法共享同一个对象** 

例如，我的例子，在 uniEntry.ts 中定义了一个 Person对象 给子组件 UserMoneyDetail 使用；
然后在子组件中对页面传入进来的 Person 对象的字段，这些改变无法体现到页面的任何地方；
mp.runtime.esm.js 中 3891行对 Vue.prototype._update 进行了修改，
其调用了 5563行的 patch 方法，此方法中调用了 5550行的 cloneWithData 方法，
cloneWithData 方法中对对象了 Json序列化 和 反序列化，
这使得，页面给子组件中通过 Prop 绑定的 Person 对象，不是页面中的 Person 对象；
这也就使得子组件修改 Person 对象时，对任何外部数据都没有任何影响；

看了看 Vue 里面的 patch 方法，被吓到了。。（此方法大约 1800行代码， 5480行--6184行）；约占整个 VUE代码的 1/6； 
PS.稀奇了, 2019-08-23 的问题无法重现了

2019-08-23. 解决  **从父组件继承下来的 prop 的无法在微信小程序绑定** 的问题; 
**父组件 BaseUniComponent.ts  就是定义了一个 父组件中的 prop ** 

       import { Component, Emit, Prop, Vue } from "vue-property-decorator";
       export default class BaseUniComponent extends Vue {
    	    @Prop({ default: null})
    	    propInParent: null | string;
       }
**子组件 UserMoneyDetail.ts (继承子父组件，并且定义了一个子组件内的 prop) **

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

**在 h5 中这个毫无疑问正常，会显示 2个 Hello**
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
但是 VueComponent.extendOptions 这个属性里面不包含有继承自父类的 Prop，这也就使得，
后面在根据返回的 vueOptions 去创建 Vue 的实例时，也丢失了从父类继承而来的 Prop, 
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

```
