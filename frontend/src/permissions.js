export function hasRole(user, ...allowedRoles) {
    return allowedRoles.includes(user?.role);
}
