import axios from 'axios';
import React, { useEffect, useState } from 'react';
import s from './Github.module.css';

const Github = () => {
	const [selectedUser, setSelectedUser] = useState<SearchUserType | null>(
		null
	);
	const [users, setUsers] = useState<SearchUserType[]>([]);
	const [tempSearch, setTempsearch] = useState('chel12'); //при вводе будем менять стейте
	const [searchTerm, setSearchTerm] = useState('chel12'); // при нажатие на кнопку будем менять стейт
	const [userDetails, setUserDetails] = useState<null | UserType>();

	//1 синхрон тайтла
	useEffect(() => {
		if (selectedUser) {
			document.title = selectedUser.login;
		}
	}, [selectedUser]); //зависимость при изменение которой useEffect будет срабатывать

	//для апи
	//2 синхрон загрузка пользователей.
	useEffect(() => {
		axios
			.get<SearchResult>(
				`https://api.github.com/search/users?q=${searchTerm}`
			)
			.then((res) => {
				//@ts-ignore
				setUsers(res.data.items);
			});
	}, [searchTerm]); //если зависит от tempSearch - то сразу рендер, иначе  searchTerm по кнопке рендерит
	//контроль инпута: 1) value; 2) (e) => {setTempsearch(e.currentTarget.value)}

	//3 синхрон
	useEffect(() => {
		if (!!selectedUser) {
			axios
				.get<UserType>(
					`https://api.github.com/users/${selectedUser.login}`
				)
				.then((res) => {
					//@ts-ignore
					setUserDetails(res.data);
				});
		}
	}, [selectedUser]);

	return (
		<div className={s.container}>
			<div>
				<div>
					<input
						placeholder="search"
						value={tempSearch}
						onChange={(e) => {
							setTempsearch(e.currentTarget.value);
						}}
					/>{' '}
					<button
						onClick={() => {
							setSearchTerm(tempSearch);
						}}>
						find
					</button>
				</div>
				<ul>
					{users.map((u) => (
						<li
							key={u.id}
							className={selectedUser === u ? s.selected : ''}
							onClick={() => {
								setSelectedUser(u); // закинуть в стейт текущего на которого кликнули
							}}>
							{u.login}
						</li>
					))}
				</ul>
			</div>
			<div>
				<h2>Username</h2>
				{userDetails && (
					<div>
						<img src={userDetails.avatar_url} alt="" />
						<br />
						{userDetails.login}, followers:{userDetails.followers}
					</div>
				)}
			</div>
		</div>
	);
};

export default Github;

type SearchUserType = {
	login: string;
	id: number;
};
type SearchResult = {
	items: SearchUserType;
};
type UserType = {
	login: string;
	id: number;
	avatar_url: string;
	followers: number;
};
