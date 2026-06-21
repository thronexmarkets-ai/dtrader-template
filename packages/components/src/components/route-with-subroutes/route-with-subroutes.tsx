import React from 'react';
import { Redirect, RedirectProps, Route, RouteComponentProps, RouteProps } from 'react-router-dom';

import { getBrandName, redirectToLogin, removeBranchName, routes as shared_routes } from '@deriv/shared';

type TRoute = RouteProps & { default: boolean };

type TRoutesWithSubRoutesProps = {
    component: React.ElementType | typeof Redirect;
    exact?: boolean;
    getTitle?: () => string;
    is_authenticated?: boolean;
    is_logged_in?: boolean;
    is_logging_in?: boolean;
    path: string;
    routes: TRoute[];
    to: RedirectProps['to'];
    language: string;
    Component404: React.ElementType;
    should_redirect_login: boolean;
};

const RouteWithSubRoutes = ({
    component: Component,
    exact,
    getTitle,
    is_authenticated,
    is_logged_in = false,
    is_logging_in = false,
    path,
    routes,
    to,
    language,
    Component404,
    should_redirect_login,
}: TRoutesWithSubRoutesProps) => {
    const validateRoute = (pathname: string) => {
        if (pathname === '') return true;

        if (path?.includes(':')) {
            const static_pathname = pathname.substring(0, pathname.lastIndexOf('/') + 1);
            return static_pathname === path.substring(0, path.indexOf(':'));
        }

        return path === pathname || !!(routes && routes.find(route => pathname === route.path));
    };

    const renderFactory = (props: RouteComponentProps<{ [key: string]: string | undefined }>) => {
        let result = null;

        if (Component === Redirect) {
            let redirect_to = to;

            if (path === shared_routes.index) {
                const { location } = props;
                redirect_to = location.pathname.toLowerCase().replace(path, '');
            }

            result = <Redirect to={redirect_to} />;
        } else if (is_authenticated && !is_logged_in && !is_logging_in) {
            if (should_redirect_login) {
                redirectToLogin(language);
            } else {
                result = <Redirect to={shared_routes.index} />;
            }
        } else {
            const default_subroute = routes.find(r => r.default);
            const pathname = removeBranchName(location.pathname).replace(/\/$/, '');
            const is_valid_route = validateRoute(pathname);
            const should_redirect = !Component404;

            // ✅ Fixed: ensure default_subroute.path is a string (not an array)
            const redirectPath = default_subroute
                ? Array.isArray(default_subroute.path)
                    ? default_subroute.path[0]
                    : default_subroute.path || '/'
                : '/';

            result = (
                <React.Fragment>
                    {default_subroute && pathname === path && <Redirect to={redirectPath} />}
                    {is_valid_route ? (
                        <Component {...props} routes={routes} />
                    ) : (
                        <React.Fragment>
                            {should_redirect ? <Redirect to={shared_routes.index} /> : <Component404 />}
                        </React.Fragment>
                    )}
                </React.Fragment>
            );
        }

        const title = getTitle?.() || '';
        document.title = `${title} | ${getBrandName()}`;

        return result;
    };

    return <Route exact={exact} path={path} render={renderFactory} />;
};

export { RouteWithSubRoutes as RouteWithSubRoutesRender };

export default RouteWithSubRoutes;