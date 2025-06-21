<!DOCTYPE html>
<html>
	<head>
		<title>Your Verification Code</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<style type="text/css">
			/* CLIENT-SPECIFIC STYLES */
			body,
			table,
			td,
			a {
				-webkit-text-size-adjust: 100%;
				-ms-text-size-adjust: 100%;
			}
			table,
			td {
				mso-table-lspace: 0pt;
				mso-table-rspace: 0pt;
			}
			img {
				-ms-interpolation-mode: bicubic;
			}

			/* RESET STYLES */
			img {
				border: 0;
				height: auto;
				line-height: 100%;
				outline: none;
				text-decoration: none;
			}
			table {
				border-collapse: collapse !important;
			}
			body {
				height: 100% !important;
				margin: 0 !important;
				padding: 0 !important;
				width: 100% !important;
			}

			/* iOS BLUE LINKS */
			a[x-apple-data-detectors] {
				color: inherit !important;
				text-decoration: none !important;
				font-size: inherit !important;
				font-family: inherit !important;
				font-weight: inherit !important;
				line-height: inherit !important;
			}

			/* MEDIA QUERIES */
			@media screen and (max-width: 480px) {
				.mobile-hide {
					display: none !important;
				}
				.mobile-center {
					text-align: center !important;
				}
			}

			/* ANDROID CENTER FIX */
			div[style*="margin: 16px 0;"] {
				margin: 0 !important;
			}

			table.mainTable tr td {
				border-radius: 4px;
			}

			table.mainTable tr:nth-of-type(1) td {
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
			}

			table.mainTable tr:nth-of-type(2) td {
				border-top-left-radius: 0;
				border-top-right-radius: 0;
			}
		</style>
  	</head>
  	<body
		style="
			margin: 0 !important;
	  		padding: 0 !important;
	  		background-color: #eeeeee;
		"
		bgcolor="#eeeeee"
 	>
		<table
	  		border="0"
	  		cellpadding="0"
	  		cellspacing="0"
	  		height="100%"
	  		style="min-height: 400px;"
	  		width="100%"
		>
	  		<tr>
				<td align="center" style="background-color: #eee;" bgcolor="#eeeeee">
		  			<table
						align="center"
						border="0"
						cellpadding="0"
						cellspacing="0"
						class="mainTable"
						width="100%"
						style="max-width: 600px;"
		  			>
						<tr>
							<td
								align="center"
								valign="top"
								style="font-size: 0; padding: 10px 20px;"
								bgcolor="050505"
							>
								<div
									style="
										display: inline-block;
										max-width: 100%;
										min-width: 100px;
										vertical-align: top;
										width: 100%;
									"
								>
									<table
										align="left"
										border="0"
										cellpadding="0"
										cellspacing="0"
										width="100%"
										style="max-width: 300px;"
									>
										<tr>
											<td
												align="left"
												valign="top"
												style="
													font-size: 36px;
													font-weight: 800;
													line-height: 26px;
												"
												class="mobile-center"
											>
					  							<img src="https://preditc.s3.us-west-2.amazonaws.com/public/blockchain.png" width="42" height="42" />
												<h1
													style="
														display: inline-block;
														font-family: 'Arial', sans-serif;
														font-size: 28px;
														font-weight: 800;
														margin: 0;
														color: #ffffff;
														vertical-align: text-top;
													"
													onclick="location.href='https://preditc.com/'"
												>
													Preditc
												</h1>
					  						</td>
										</tr>
				  					</table>
								</div>
			  				</td>
						</tr>
						<tr>
							<td
								align="center"
								style="padding: 35px; background-color: #ffffff;"
								bgcolor="#ffffff"
							>
								<table
									align="center"
									border="0"
									cellpadding="0"
									cellspacing="0"
									width="100%"
									style="max-width: 600px;"
								>
									<tr>
										<td
											align="left"
											style="
												font-family: Open Sans, Helvetica, Arial, sans-serif;
												font-size: 16px;
												font-weight: 400;
												line-height: 24px;
												padding-bottom: 15px;
											"
										>
											<p
												style="
													font-size: 18px;
													font-weight: 800;
													line-height: 24px;
													color: #333333;
												"
											>
												Hi {{ $user->name }},
											</p>
											<p
												style="
													font-size: 16px;
													font-weight: 400;
													line-height: 24px;
													color: #777777;
												"
											>
												Your verification code is:
												<b>{{ $user->verification_code }}</b>
											</p>
											<p
												style="
													font-size: 16px;
													font-style: italic;
													font-weight: 400;
													line-height: 24px;
													color: #aaa;
													margin-top: 28px;
												"
											>
												Sincerely,
											</p>
											<p
												style="
													font-size: 16px;
													font-style: italic;
													font-weight: 400;
													line-height: 24px;
													color: #aaa;
												"
											>
												The Preditc Team
											</p>
										</td>
									</tr>
								</table>
			  				</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
  	</body>
</html>