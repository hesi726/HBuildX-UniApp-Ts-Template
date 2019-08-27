import { enumerable } from './Decorators';
export default class Person {
	/**
	 * 
	 */
	constructor(public name: string, public jsonSerializeTimes: number = 1) {		
	}
	
	@enumerable(true)
	get nameInGet(): string {
		console.log('准备通过 get 去获取 name');
		return this.name;
	}
}