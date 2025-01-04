interface WeatherIconProps {
  icon: string;
  description: string;
}

const WeatherIcon = ({ icon, description }: WeatherIconProps) => {
  const iconUrl = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';

  return (
    <div className="relative flex items-center justify-center w-5 h-5 -mx-1">
      <img
        src={iconUrl}
        alt={description}
        width={40}
        height={40}
        className="w-8 h-8 object-cover contrast-125 saturate-150 brightness-95"
        loading="lazy"
        style={{
          filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.1))',
          transform: 'scale(1.2)',
        }}
      />
    </div>
  );
};

export default WeatherIcon; 