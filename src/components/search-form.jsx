import React from 'react';
import {browserHistory} from 'react-router';

const isEscape = (keyCode) => keyCode && keyCode === 27;
const isEnter = (keyCode) => keyCode && keyCode === 13;

const fireSearch = searchText => browserHistory.push(`/search?qs=${searchText}`);

export default class SearchForm extends React.Component {
  constructor() {
    super();
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSearchButton = this.handleSearchButton.bind(this);
  }

  handleSearch({keyCode, target}) {
    if (isEscape(keyCode)) {
      this.refs.search.blur();
      return this.refs.search.value = '';
    }

    if (isEnter(keyCode) && target.value !== '') {
      return fireSearch(target.value);
    }
  }

  handleSearchButton() {
    const searchText = this.refs.search.value;
    if (searchText !== '') {
      this.refs.search.blur();
      this.refs.search.value = '';
      return fireSearch(searchText);
    } else {
      this.refs.search.focus();
    }
  }

  render() {
    return (
      <div className='search-form'>
        <input placeholder='Search request' onKeyDown={this.handleSearch} className='search-input' ref='search'/>
        <button type='button' className='search-button' onClick={this.handleSearchButton}>Search</button>
      </div>
    );
  }
}
