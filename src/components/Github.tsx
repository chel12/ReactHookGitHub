import axios from 'axios';
import React, { useEffect, useState } from 'react';
import s from './Github.module.css';
let initialSearchState = 'chel12';

type SearchPropsType = {
	value: string;
	onSubmit: (fixedValue: string) => void;
};
export const Search = (props: SearchPropsType) => {
	const [tempSearch, setTempsearch] = useState(''); //при вводе будем менять стейте
	useEffect(() => {
		setTempsearch(props.value);
	}, [props.value]);
	return (
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
					props.onSubmit(tempSearch); //передаем в коллбек функцию
				}}>
				find
			</button>
		</div>
	);
};

export const UserList = (props: UsersListPropsType) => {
	const [users, setUsers] = useState<SearchUserType[]>([]);
	useEffect(() => {
		//но он зависит от searchTerm, который хранится у родителя
		axios
			.get<SearchResult>(
				`https://api.github.com/search/users?q=${props.term}`
			)
			.then((res) => {
				//@ts-ignore
				setUsers(res.data.items);
			});
	}, [props.term]);
	return (
		
			<ul>
				{users.map((u) => (
					<li
						key={u.id}
						className={props.selectedUser === u ? s.selected : ''} //пропсы из родителя
						onClick={() => {
							props.onUserSelect(u); // закинуть в стейт текущего на которого кликнули. А теперь колбеком к родителю
						}}>
						{u.login}
					</li>
				))}
			</ul>
		
	);
};

export const Github = () => {
	const [selectedUser, setSelectedUser] = useState<SearchUserType | null>(
		null
	);
	// const [users, setUsers] = useState<SearchUserType[]>([]);
	// const [tempSearch, setTempsearch] = useState('chel12'); //при вводе будем менять стейте
	const [searchTerm, setSearchTerm] = useState(initialSearchState); // при нажатие на кнопку будем менять стейт
	const [userDetails, setUserDetails] = useState<null | UserType>();

	//1 синхрон тайтла
	useEffect(() => {
		if (selectedUser) {
			document.title = selectedUser.login;
		}
	}, [selectedUser]); //зависимость при изменение которой useEffect будет срабатывать

	//для апи
	//2 синхрон загрузка пользователей.
	// useEffect(() => {
	// 	axios
	// 		.get<SearchResult>(
	// 			`https://api.github.com/search/users?q=${searchTerm}`
	// 		)
	// 		.then((res) => {
	// 			//@ts-ignore
	// 			setUsers(res.data.items);
	// 		});
	// }, [searchTerm]); //если зависит от tempSearch - то сразу рендер, иначе  searchTerm по кнопке рендерит
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
		//передаем пропсы из комоненты
		<div className={s.container}>
			<Search
				value={searchTerm}
				onSubmit={(value: string) => {
					setSearchTerm(value);
				}}
			/>
			
			<div>
				<button
					onClick={() => {
						setSearchTerm(initialSearchState);
					}}>
					Reset
				</button>
			</div>
			<UserList
					term={searchTerm}
					onUserSelect={setSelectedUser} //колбек и сетаем юзера (сеттер и геттер)
					selectedUser={selectedUser}
				/>
			
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

type UsersListPropsType = {
	term: string; //для поиска
	selectedUser: SearchUserType | null; //для выбранного
	onUserSelect: (user: SearchUserType) => void; //для колбека, чтобы передать в синхрониз
};
