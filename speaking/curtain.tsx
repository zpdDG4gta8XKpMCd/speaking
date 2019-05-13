import * as React from 'react';
import { addClassIfDefined } from './react';

export interface CurtainProps {
    className?: string;
    onClickedCurtain: () => void;
}

export class Curtain extends React.Component<CurtainProps> {
    render() {
        const { className, onClickedCurtain } = this.props;
        return <div className={'curtain ' + addClassIfDefined(className)} onClick={onClickedCurtain}>
            {this.props.children}
        </div>;
    }
}
