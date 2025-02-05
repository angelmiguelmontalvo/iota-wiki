/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { ComponentProps, isValidElement, ReactElement } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import CodeBlock, { Props } from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import FullscreenImage from '@site/src/components/FullscreenImage';
import Details from '@theme/Details';
import type { MDXComponentsObject } from '@theme/MDXComponents';

interface ExtendedMDXComponentsObject extends MDXComponentsObject {
  readonly img: (props: ComponentProps<'img'>) => JSX.Element;
}

import './styles.css';

// MDX elements are wrapped through the MDX pragma
// In some cases (notably usage with Head/Helmet) we need to unwrap those elements.

function unwrapMDXElement(element: ReactElement) {
  if (element?.props?.mdxType && element?.props?.originalType) {
    delete element.props.mdxType;
    const { originalType, ...newProps } = element.props;
    return React.createElement(originalType, newProps);
  }

  return element;
}

const MDXComponents: ExtendedMDXComponentsObject = {
  head: (props) => {
    const unwrappedChildren = React.Children.map(props.children, (child) =>
      unwrapMDXElement(child as ReactElement),
    );
    return <Head {...props}>{unwrappedChildren}</Head>;
  },
  code: (props) => {
    const { children } = props;

    // For retrocompatibility purposes (pretty rare use case)
    // See https://github.com/facebook/docusaurus/pull/1584

    if (isValidElement(children)) {
      return children;
    }

    return !children.includes('\n') ? (
      <code {...props} />
    ) : (
      <CodeBlock {...props} />
    );
  },
  a: (props) => <Link {...props} />,
  pre: (props) => {
    const { children } = props;

    // See comment for `code` above
    if (isValidElement(children) && isValidElement(children?.props?.children)) {
      return children.props.children;
    }

    return (
      <CodeBlock
        {...((isValidElement(children)
          ? children?.props
          : { ...props }) as Props)}
      />
    );
  },
  details: (props): JSX.Element => {
    const items = React.Children.toArray(props.children) as ReactElement[];
    // Split summary item from the rest to pass it as a separate prop to the Details theme component
    const summary: ReactElement<ComponentProps<'summary'>> = items.find(
      (item) => item?.props?.mdxType === 'summary',
    );
    const children = <>{items.filter((item) => item !== summary)}</>;

    return (
      <Details {...props} summary={summary}>
        {children}
      </Details>
    );
  },
  h1: (props) => <Heading as='h1' {...props} />,
  h2: (props) => <Heading as='h2' {...props} />,
  h3: (props) => <Heading as='h3' {...props} />,
  h4: (props) => <Heading as='h4' {...props} />,
  h5: (props) => <Heading as='h5' {...props} />,
  h6: (props) => <Heading as='h6' {...props} />,
  img: (props) => <FullscreenImage.Source {...props} />,
};

export default MDXComponents;
