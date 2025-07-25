import { Grid, Segment } from "semantic-ui-react"
import { useSelector } from "react-redux"
import { dateFormat, nyc } from "@utils/date"
import { ReduxState } from "@interfaces/index"
import { DateTime } from "luxon"
import classNames from "classnames"
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

    const dt = DateTime.fromFormat(date, dateFormat).setZone(nyc)
    const startWeek = dt.startOf("week")
    const sat = startWeek.plus({ days: 5 })
    const sun = startWeek.plus({ days: 6 })

    const gridClass = classNames({ dateGridComponent: true })

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
                        const weekdate = startWeek.plus({ days: i })
                        return (
                            <Grid.Column
                                className={dt.hasSame(weekdate, "day") ? "active" : ""}
                                key={d}
                                onClick={() => onClickDate(weekdate.toFormat(dateFormat))}
                            >
                                {d}
                                <p className="dateSubHeader">
                                    {weekdate.month}/{weekdate.day}
                                </p>
                            </Grid.Column>
                        )
                    })}
                    <Grid.Column
                        className={dt.hasSame(sat, "day") || dt.hasSame(sun, "day") ? "active" : ""}
                        onClick={() => onClickDate(sat.toFormat(dateFormat))}
                    >
                        {weekend}
                        <p className="dateSubHeader">
                            {sat.month}/{sat.day} + {sun.month}/{sun.day}
                        </p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    )
}

export default DateGrid
