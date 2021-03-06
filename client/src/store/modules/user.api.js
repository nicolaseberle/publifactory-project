import Vue from 'vue';
import axios from 'axios';
// import { authSocket } from '../../socket'
const debug = require('debug')('frontend');

export async function userLoginSync({ email, password }) {
	const response = await axios.post('/api/auth/local', { email, password });
	return response;
}

export async function userGetUserInfo({ token }) {
	const response = await axios.get('/api/users/me', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return response;
}

export async function login(email, password) {
	return new Promise((resolve, reject) => {
		Vue.http
			.post('auth/local', {
				email,
				password
			})
			.then(res => resolve(res.json()))
			.catch(err => reject(err));
	});
}

export function checkEmail(userId) {
	return Vue.http
		.patch('users/confirmation', {
			userId
		})
		.then(res => res.json());
}

export function loginOrcid(orcidId, password) {
	return Vue.http
		.post('auth/local/orcid', {
			orcidId,
			password
		})
		.then(res => console.log(res.json()));
}

export function changePassword(oldPassword, newPassword, token) {
	return Vue.http
		.put('users/changePassword', {
			oldPassword,
			newPassword,
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		.then(res => res.json());
}

export function resetGuestPassword(id, newPassword, token) {
	return Vue.http
		.put('users/' + id + '/guestPassword', {
			password: newPassword,
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		.then(res => res.json());
}

export function resetPassword(email) {
	return Vue.http
		.put('users/resetPassword', {
			email
		})
		.then(res => res.json());
}

export function updateUser(firstname, lastname, field, token) {
	return Vue.http
		.put('users/updateUser', {
			firstname,
			lastname,
			field,
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		.then(res => res.json());
}

export function getUserInfo(token) {
	return new Promise(resolve => {
		Vue.http
			.get('users/me', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			.then(data => data.json())
			.then(data => {
				/* authSocket(token, () => {
        debug('Token authenticated.')
      })*/
				resolve(data);
			})
			.catch(() => {
				resolve({});
			});
	});
}
