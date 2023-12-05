import axios from 'axios';
import React, { useEffect, useState } from 'react';
import s from './Github.module.css';

const Github = () => {
	const [selectedUser, setSelectedUser] = useState<SearchUserType | null>(
		null
	);
	const [users, setUsers] = useState<SearchUserType[]>([]);
	const [tempSearch, setTempsearch] = useState('chel12');

	const fetchData = (term: string) => {
		axios
			.get<SearchResult>(`https://api.github.com/search/users?q=${term}`)
			.then((res) => {
				//@ts-ignore
				setUsers(res.data.items);
			});
	};

	useEffect(() => {
		if (selectedUser) {
			document.title = selectedUser.login;
		}
	}, [selectedUser]); //зависимость при изменение которой useEffect будет срабатывать

	//для апи
	useEffect(() => {
		fetchData(tempSearch);
	}, [tempSearch]);
	//контроль инпута: 1) value; 2) (e) => {setTempsearch(e.currentTarget.value)}
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
					<button>find</button>
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
				<div>Details</div>
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
