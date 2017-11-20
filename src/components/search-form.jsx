import React from 'react';
import { browserHistory } from 'react-router';

const isEscape = (keyCode) => keyCode && keyCode === 27;
const isEnter = (keyCode) => keyCode && keyCode === 13;

const fireSearch = (searchText) => browserHistory.push(`/search?qs=${encodeURIComponent(searchText)}`);

const subscribeOnHistory = (input) => {
  browserHistory.listen((newRoute) => {
    if (newRoute.pathname === '/search') {
      input.value = newRoute.query.qs || '';
    } else {
      input.value = '';
    }
  });
};

export default class SearchForm extends React.Component {
  constructor() {
    super();
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSearchButton = this.handleSearchButton.bind(this);
    this.rememberInput = this.rememberInput.bind(this);
  }

  handleSearch({ keyCode, target }) {
    if (isEscape(keyCode)) {
      this.searchInput.blur();
      return this.searchInput.value = '';
    }

    if (isEnter(keyCode) && target.value !== '') {
      return fireSearch(target.value);
    }
  }

  handleSearchButton() {
    const searchText = this.searchInput.value;

    if (searchText !== '') {
      this.searchInput.blur();
      this.searchInput.value = '';
      return fireSearch(searchText);
    }

    this.searchInput.focus();
  }

  rememberInput(ref) {
    this.searchInput = ref;
    subscribeOnHistory(this.searchInput);
  }


  render() {
    return (
      <div className="search-form">
        <input placeholder="Search request" onKeyDown={this.handleSearch} className="search-input" ref={this.rememberInput}/>
        <button type="button" className="search-button" onClick={this.handleSearchButton}>Search</button>
      </div>
    );
  }
}
