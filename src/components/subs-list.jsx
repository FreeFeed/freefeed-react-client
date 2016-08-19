import React from 'react';

import {tileUserListFactory, WITH_MUTUALS} from './tile-user-list';
const TileList = tileUserListFactory({type: WITH_MUTUALS});

import throbber16 from 'assets/images/throbber-16.gif';

export default (props) => {

  const title = props.title || "No title";

  if (props.isPending) {

    return (
      <div>
        <h3>
          <span>{title} </span>
          <span className="comment-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        </h3>
      </div>
    );

  } else if (props.errorString) {

    return (
      <div>
        <h3><span>{title}</span></h3>
        <span className="error-string">{props.errorString}</span>
      </div>
    );

  } else {

    const sections = props.listSections.filter(s => s.users.length > 0);
    const showTitles = !!props.showSectionsTitles || (sections.length > 1);

    return (
      <div>
        <h3><span>{title}</span></h3>

        {sections.map(s => [
          (showTitles && s.title) ? <h4 className="tile-list-subheader">{s.title}</h4> : false,
          <TileList users={s.users}/>
        ])}

      </div>
    );

  }
};
