const createError = (path: string, errorCode: string, message: string) => ({
	path,
	errorCode,
	message
});

export const USER_EXISTS = createError(
	'register',
	'user_exists',
	'user already exists'
);

export const USER_NOT_EXISTS = createError(
	'login',
	'no_user',
	'user is not registered'
);

export const PASSWORD_INVALID = createError(
	'login',
	'password_invalid',
	'password is not valid'
);

export const NO_ACCESS = createError(
	'add_feed',
	'no_access',
	"you don't have access"
);

export const ADMIN_NOT_EXISTS = createError(
	'admin_login',
	'admin_not_exists',
	"admin doesn't exists"
);
