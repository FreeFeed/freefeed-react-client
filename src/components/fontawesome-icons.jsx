import React from 'react';
import cn from 'classnames';
import {
  faCloudUploadAlt,
  faHeart,
  faAt,
  faAngleUp,
  faChevronLeft,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  faComment,
  faHeart as faHeartO,
} from '@fortawesome/free-regular-svg-icons';
import { faCommentPlus } from './fontawesome-custom-icons';

// Our icon library
// Only these icons will be included to the bundle
const icons = [
  faCloudUploadAlt,
  faComment,
  faHeart,
  faHeartO,
  faAt,
  faAngleUp,
  faChevronLeft,
  faCircle,
  faCommentPlus,
];

export function SVGSymbolDeclarations() {
  return (
    <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
      {icons.map(({ iconName, prefix, icon: [width, height,,, path] }, i) => (
        <symbol
          key={i}
          aria-hidden="true" focusable="false" role="img"
          viewBox={`0 0 ${width} ${height}`}
          id={`fa-icon-${prefix}-${iconName}`}
        >
          <path fill="currentColor" d={path} />
        </symbol>
      ))}
    </svg>
  );
}

export function Icon({ name, prefix = "fas", className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, `fa-icon fa-icon-${prefix}-${name}`)}
    >
      <use xlinkHref={`#fa-icon-${prefix}-${name}`} />
    </svg>
  );
}
