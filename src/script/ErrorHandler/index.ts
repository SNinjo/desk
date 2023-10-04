import * as SCRIPT from '../Method';


export function initialize() {
	window.addEventListener('error', (errorEvent) => {
		// google 登入時進入密碼頁面會觸發, 待釐清
		if (errorEvent.message === 'ResizeObserver loop limit exceeded') return;

		SCRIPT.log('warn', `An error is thrown in script | ${errorEvent.message}`);
		SCRIPT.done();
	});
}