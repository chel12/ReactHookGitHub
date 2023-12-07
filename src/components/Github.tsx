import axios from 'axios';
import React, { useEffect, useState } from 'react';
import s from './Github.module.css';
let initialSearchState = 'chel12';
let number = 10;
export const Timer = (props: TimerProps) => {
	const [seconds, setSeconds] = useState(props.seconds); //при первой отрисовки фиксирует 60

	useEffect(() => {
		setSeconds(props.seconds);
	}, [props.seconds]);
	useEffect(() => {
		//далее фиксируется useEffect, но не запускается
		const intervalId = setInterval(() => {
			//рендер и обращение к секундам, у самой функции секунд нет, и происходити замыкание(наверх вылезает и ищет у родителя)
			//получается она вылазеет к 60 берет и рисует 59, и далее выполняет все тоже самое по кругу, соотвественно не меняется значение и реакт компонента не делает рендер
			setSeconds((prev) => prev - 1); //делает от предыдущего значения а не вручную
		}, 1000);
		return () => {
			clearInterval(intervalId); // средство зачистки для интервала
		};
		//cleanup function для очистки
	}, [props.timerKey]); // почему не перебивает код из тела? потому что вызывается функция 1 раз, у неё нет зависимостей
	//затем нужно синхрон таймера сделать при выборе нового юзера
	//для других случаев аналогично, дестрой элементов, removeEventod  и закрытие вебсокетов
	useEffect(() => {
		//при изменение seconds дадим актульные секунды родителю через колбек
		props.onChange(seconds);
	}, [seconds]);
	return <div>{seconds}</div>;
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
export const UserDetails = (props: UserDetailsPropsType) => {
	const [userDetails, setUserDetails] = useState<null | UserType>(null);
	const [seconds, setSeconds] = useState(number);
	useEffect(() => {
		if (!!props.user) {
			axios
				.get<UserType>(
					`https://api.github.com/users/${props.user.login}`
				)
				.then((res) => {
					//@ts-ignore
					setSeconds(number); //порядок важен иначе юзер раньше времени будет грузиться и таймер не обнулится
					setUserDetails(res.data);
				});
		}
	}, [props.user]);

	useEffect(() => {
		if (seconds < 1) {
			setUserDetails(null);
		}
	}, [seconds]);

	return (
		<div>
			{userDetails && (
				<div>
					<Timer
						seconds={seconds}
						onChange={setSeconds}
						timerKey={userDetails.id.toString()}
					/>
					<h2>{userDetails.login}</h2>
					<img src={userDetails.avatar_url} alt="" />
					<br />
					{userDetails.login}, followers:{userDetails.followers}
				</div>
			)}
		</div>
	);
};
export const Github = () => {
	const [selectedUser, setSelectedUser] = useState<SearchUserType | null>(
		null
	);
	// const [users, setUsers] = useState<SearchUserType[]>([]);
	// const [tempSearch, setTempsearch] = useState('chel12'); //при вводе будем менять стейте
	const [searchTerm, setSearchTerm] = useState(initialSearchState); // при нажатие на кнопку будем менять стейт

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
	// useEffect(() => {
	// 	if (!!selectedUser) {
	// 		axios
	// 			.get<UserType>(
	// 				`https://api.github.com/users/${selectedUser.login}`
	// 			)
	// 			.then((res) => {
	// 				//@ts-ignore
	// 				setUserDetails(res.data);
	// 			});
	// 	}
	// }, [selectedUser]);

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

			<UserDetails user={selectedUser} />
		</div>
	);
};

export default Github;

type SearchPropsType = {
	value: string;
	onSubmit: (fixedValue: string) => void;
};

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

type UserDetailsPropsType = {
	user: SearchUserType | null;
};

type TimerProps = {
	seconds: number;
	onChange: (actualSeconds: number) => void;
	timerKey: string;
};
