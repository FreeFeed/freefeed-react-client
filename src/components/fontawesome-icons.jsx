import { memo, forwardRef } from 'react';
import cn from 'classnames';
import {
  faHeart,
  faLock,
  faGlobeAmericas,
  faUserFriends,
  faPaperclip,
  faBell,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { faComment, faHeart as faHeartO, faImage } from '@fortawesome/free-regular-svg-icons';
import { faCommentPlus } from './fontawesome-custom-icons';

// These icons will be embedded to the page just once
// (in <SVGSymbolDeclarations> element) and will be linked
// via SVG <use> tag. Use it for the icons that may have
// many instances on the single page.
const preloadedIcons = [
  faComment,
  faHeart,
  faHeartO,
  faCommentPlus,
  faLock,
  faGlobeAmericas,
  faUserFriends,
  faImage,
  faPaperclip,
  faBell,
  faUser,
];

export const SVGSymbolDeclarations = memo(function SVGSymbolDeclarations() {
  return (
    <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
      {preloadedIcons.map(({ iconName, prefix, icon: [width, height, , , path] }) => (
        <symbol
          key={`icon-${prefix}-${iconName}`}
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          id={`fa-icon-${prefix}-${iconName}`}
        >
          <path fill="currentColor" d={path} />
        </symbol>
      ))}
    </svg>
  );
});

export const Icon = memo(
  forwardRef(function Icon({ icon, className, title, ...props }, ref) {
    const id = `fa-icon-${icon.prefix}-${icon.iconName}`;

    if (preloadedIcons.includes(icon)) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn(className, `fa-icon ${id}`)}
          ref={ref}
          {...props}
        >
          {title && <title>{title}</title>}
          <use xlinkHref={`#${id}`} />
        </svg>
      );
    }

    const {
      icon: [width, height, , , path],
    } = icon;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className, `fa-icon ${id}`)}
        ref={ref}
        aria-hidden="true"
        focusable="false"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        {...props}
      >
        {title && <title>{title}</title>}
        <path fill="currentColor" d={path} />
      </svg>
    );
  }),
);
