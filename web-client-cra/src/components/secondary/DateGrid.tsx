import { Grid, Segment } from "semantic-ui-react"
import { useSelector } from "react-redux"
import { dateFormat, isSunday, nyc } from "@utils/date"
import { ReduxState } from "@interfaces/index"
import classNames from "classnames"
import moment from "moment-timezone"
import translations from "@assets/translate.json"

type Props = {
    date: string
    onClickDate: (date: string) => void
}

const DateGrid = ({ date, onClickDate = () => null }: Props) => {
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    const days = lang.days
    const lastIndex = days.length - 1
    const weekend = days[lastIndex]

    const m = moment(date).tz(nyc)
    const startWeek = (isSunday(date) ? m.subtract(1, "days") : m).startOf("week").add(1, "days")
    const sat = moment(startWeek, dateFormat).add(5, "days")
    const sun = moment(startWeek, dateFormat).add(6, "days")

    const gridClass = classNames({
        dateGridComponent: true
    })

    return (
        <div className={gridClass}>
            <Grid
                as={Segment}
                basic
                className="headerGrid"
                celled="internally"
                columns="equal"
                inverted={inverted}
                stackable
                textAlign="center"
            >
                <Grid.Row>
                    {days.map((d, i) => {
                        // Leave the logic for the weekend in its own block
                        if (i === lastIndex) {
                            return false
                        }
                        const weekdate = moment(startWeek).tz(nyc).add(i, "days")
                        return (
                            <Grid.Column
                                className={weekdate.isSame(date, "day") ? "active" : ""}
                                key={d}
                                onClick={() => onClickDate(weekdate.format(dateFormat))}
                            >
                                {d}
                                <p className="dateSubHeader">{weekdate.format("MM/DD")}</p>
                            </Grid.Column>
                        )
                    })}
                    <Grid.Column
                        className={
                            sat.isSame(date, "day") || sun.isSame(date, "day") ? "active" : ""
                        }
                        onClick={() => onClickDate(sat.format(dateFormat))}
                    >
                        {weekend}
                        <p className="dateSubHeader">
                            {sat.format("MM/DD")} + {sun.format("MM/DD")}
                        </p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    )
}

export default DateGrid
