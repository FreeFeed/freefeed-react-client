/* global jest, describe, it, expect */
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonLink } from '../../src/components/button-link';

describe('ButtonLink', () => {
  it('Works correctly', () => {
    const onClick = jest.fn();
    const { asFragment } = render(
      <ButtonLink id="some-id" className="some-class" onClick={onClick}>
        Click me!
      </ButtonLink>,
    );

    expect(asFragment()).toMatchSnapshot();

    fireEvent.click(screen.getByText('Click me!'));
    expect(onClick).toHaveBeenCalledTimes(1);

    const spaceBarKeyEvent = { keyCode: 32, preventDefault: () => {} };
    fireEvent.keyDown(screen.getByText('Click me!'), spaceBarKeyEvent);
    fireEvent.keyUp(screen.getByText('Click me!'), spaceBarKeyEvent);
    expect(onClick).toHaveBeenCalledTimes(2);

    const enterKeyEvent = { keyCode: 13, preventDefault: () => {} };
    fireEvent.keyDown(screen.getByText('Click me!'), enterKeyEvent);
    fireEvent.keyUp(screen.getByText('Click me!'), enterKeyEvent);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("Doesn't work if disabled", () => {
    const onClick = jest.fn();
    const { asFragment } = render(
      <ButtonLink disabled onClick={onClick}>
        Click me!
      </ButtonLink>,
    );

    expect(asFragment()).toMatchSnapshot();

    fireEvent.click(screen.getByText('Click me!'));

    const spaceBarKeyEvent = { keyCode: 32, preventDefault: () => {} };
    fireEvent.keyDown(screen.getByText('Click me!'), spaceBarKeyEvent);
    fireEvent.keyUp(screen.getByText('Click me!'), spaceBarKeyEvent);

    const enterKeyEvent = { keyCode: 13, preventDefault: () => {} };
    fireEvent.keyDown(screen.getByText('Click me!'), enterKeyEvent);
    fireEvent.keyUp(screen.getByText('Click me!'), enterKeyEvent);

    expect(onClick).not.toHaveBeenCalled();
  });
});
