<template>
	<view>
		<view>根组件的title: {{title}}</view>
		<view>根组件的Person:{{person.name}}--{{person.jsonSerializeTimes}}</view>		
		<hr/>
		<UserMoney :assignperson.sync='person' :propInComponent='title' :propInParent='title'></UserMoney>
		<br>
		<hr>
		<view>跟组件的元素</view>	
		<button @click='changeTitle'>改变根组件的Title</button>
		<button @click='changePerson'>改变根组件的Person</button>
	</view>
</template>
<script lang="ts" src='./unientry.ts'></script>
