// ==UserScript==
// @name         Greasy Fork - Change Default Script Sort
// @namespace    https://greasyfork.org/users/649
// @version      1.2.19
// @description  Change default script sort on GreasyFork
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/users/*
// @match        *://greasyfork.org/*/scripts*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @run-at       document-start
// ==/UserScript==

(() => {
	'use strict';

	const Util = {
		q(query, context = document) {
			return context.querySelector(query);
		},
		getQueryParam(name, url = location.href) {
			name = name.replace(/[[\]]/g, '\\$&');
			const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
			const results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		},
		setQueryParam(key, value, url = location.href) {
			const regex = new RegExp(`([?&])${key}=.*?(&|#|$)(.*)`, 'gi');
			const hasValue = (typeof value !== 'undefined' && value !== null && value !== '');
			if (regex.test(url)) {
				if (hasValue) {
					return url.replace(regex, `$1${key}=${value}$2$3`);
				} else {
					const [path, hash] = url.split('#');
					url = path.replace(regex, '$1$3').replace(/(&|\?)$/, '');
					if (hash) url += `#${hash[1]}`;
					return url;
				}
			} else if (hasValue) {
				const separator = url.includes('?') ? '&' : '?';
				const [path, hash] = url.split('#');
				url = `${path + separator + key}=${value}`;
				if (hash) url += `#${hash[1]}`;
				return url;
			} else return url;
		}
	};

	const commonValues = [
		{ value: 'daily-installs', text: 'Daily installs' },
		{ value: 'total_installs', text: 'Total installs' },
		{ value: 'ratings', text: 'Ratings' },
		{ value: 'created', text: 'Created date' },
		{ value: 'updated', text: 'Updated date' },
		{ value: 'name', text: 'Name' }
	];
	const Config = GM_config([
		{
			key: 'all',
			label: 'All Scripts Sort',
			default: 'daily-installs',
			type: 'dropdown',
			values: commonValues
		}, {
			key: 'search',
			label: 'Search Sort',
			default: 'relevance',
			type: 'dropdown',
			values: [{ value: 'relevance', text: 'Relevance' }].concat(commonValues)
		}, {
			key: 'user',
			label: 'User Profile Sort',
			default: 'daily-installs',
			type: 'dropdown',
			values: commonValues
		}
	]);
	GM_registerMenuCommand('GreasyFork Sort Settings', Config.setup);

	const onScripts = location.href.match(/^https?:\/\/greasyfork\.org\/[^/]+\/scripts\/?(?:\?.*)?$/i);
	const onSearch = location.href.match(/^https?:\/\/greasyfork\.org\/[^/]+\/scripts\/search?(?:\?.*)?$/i);
	const onProfile = location.href.match(/^https?:\/\/greasyfork\.org\/[^/]+\/users\/[^/]+?(?:\?.*)?$/i);

	document.addEventListener('DOMContentLoaded', () => {
		const defaultSort = Util.q('#script-list-sort > ul > li:nth-child(1) > a');
		if (defaultSort) {
			if (onSearch) {
				defaultSort.href = Util.setQueryParam('sort', 'relevance', defaultSort.href);
			} else {
				defaultSort.href = Util.setQueryParam('sort', 'daily-installs', defaultSort.href);
			}
		}
	});

	const sort = Util.getQueryParam('sort');
	if (!sort) {
		const cfg = Config.load();
		let cfgSort;
		if (onScripts) {
			cfgSort = cfg.all;
		} else if (onSearch) {
			cfgSort = cfg.search;
		} else if (onProfile) {
			cfgSort = cfg.user;
		}
		if (cfgSort) {
			window.location.replace(Util.setQueryParam('sort', cfgSort));
		}
	}
})();
