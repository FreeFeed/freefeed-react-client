import React from 'react';
import { Throbber } from './throbber';
import { tileUserListFactory, WITH_MUTUALS } from './tile-user-list';

const TileList = tileUserListFactory({ type: WITH_MUTUALS });

export default function SubsList(props) {
  const title = props.title || 'No title';

  if (props.isPending) {
    return (
      <div>
        <h3>
          <span>{title} </span>
          <span className="comment-throbber">
            <Throbber />
          </span>
        </h3>
      </div>
    );
  }

  if (props.errorString) {
    return (
      <div>
        <h3>
          <span>{title}</span>
        </h3>
        <span className="error-string">{props.errorString}</span>
      </div>
    );
  }

  const sections = props.listSections.filter((s) => s.users.length > 0);
  const showTitles = !!props.showSectionsTitles || sections.length > 1;

  return (
    <div>
      <h3>
        <span>{title}</span>
      </h3>

      {sections.map((s) => (
        <React.Fragment key={s.title}>
          {showTitles && s.title ? <h4 className="tile-list-subheader">{s.title}</h4> : false}
          <TileList users={s.users} />
        </React.Fragment>
      ))}

      {sections.length === 0 ? <div>Nobody{"'"}s here!</div> : ''}
    </div>
  );
}
