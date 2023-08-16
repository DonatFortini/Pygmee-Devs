import logo from '../assets/logo_pygmee.png';
import unfold from '../assets/unfold.svg';

function Header() {
    
    function sideScreen() {
        document.getElementById('unfold')!.style.display = 'none';
        document.getElementById('col')!.style.display = 'inherit';
    }

    return (
        <div className="header">
            <img id='unfold' className='unfold' src={unfold} onClick={sideScreen} />
            <img className='logo' src={logo} alt="" />
            <label id="label" className="label"></label>
        </div>
    );
}

export { Header }