<template>
	<view class="user-money-detail">		
		<view>子组件</view>
		<hr/>
		<view>子组件内定义的Prop: {{propInComponent}}</view>
		<view>子组件继承自父组件的Prop: {{propInParent}}</view>
		<view>子组件内定义的字段:{{tipsInComponent}}</view>
		<view>子组件继承子父组件字段:{{tipsInParent}}</view>		
		<view>通过Prop设置的assignperson:{{assignperson.name}}--{{assignperson.jsonSerializeTimes}}</view>	
		<view>演示通过get获取name: {{person.nameInGet}}</view>
		<button @click='setPersonName'>子组件内测试设置PersonName</button>
	</view>
</template>
<script lang="ts" src='./UserMoneyDetail.ts'></script>
<style type='text/css'>
	.user-money-detail {
		background-color: #fefefe;
	}
</style>
